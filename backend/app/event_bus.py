import asyncio
import logging
import datetime
from typing import Dict, Any, Callable, List

logger = logging.getLogger("nexus.event_bus")

class EventBus:
    """
    Asynchronous event bus supporting non-blocking queuing, retries,
    idempotency tracking, and dead-letter handling for alert spikes.
    """
    def __init__(self, max_queue_size: int = 1000):
        self._max_queue_size = max_queue_size
        self._queue = None
        self._processed_ids: set = set()
        self._dead_letter_queue: List[Dict[str, Any]] = []
        self._handlers: List[Callable] = []
        self._worker_task = None
        self._running: bool = False
        self.total_ingested: int = 0
        self.total_processed: int = 0
        self.total_failed: int = 0

    def register_handler(self, handler: Callable):
        self._handlers.append(handler)

    async def publish(self, event: Dict[str, Any]) -> bool:
        if self._queue is None:
            self._queue = asyncio.Queue(maxsize=self._max_queue_size)
        event_id = event.get("event_id")
        if event_id and event_id in self._processed_ids:
            logger.info(f"EventBus: Idempotent duplicate event discarded ({event_id}).")
            return False

        try:
            self._queue.put_nowait(event)
            self.total_ingested += 1
            if event_id:
                self._processed_ids.add(event_id)
            return True
        except asyncio.QueueFull:
            logger.error("EventBus: Queue full! Appending to dead-letter queue.")
            self._dead_letter_queue.append({
                "event": event,
                "reason": "QueueFull",
                "timestamp": datetime.datetime.utcnow().isoformat()
            })
            self.total_failed += 1
            return False

    async def _worker_loop(self):
        while self._running:
            try:
                event = await self._queue.get()
                for handler in self._handlers:
                    retry_count = 0
                    success = False
                    while retry_count < 3 and not success:
                        try:
                            if asyncio.iscoroutinefunction(handler):
                                await handler(event)
                            else:
                                handler(event)
                            success = True
                            self.total_processed += 1
                        except Exception as e:
                            retry_count += 1
                            logger.warning(f"EventBus handler retry {retry_count}/3 failed: {e}")
                            await asyncio.sleep(0.5 * retry_count)

                    if not success:
                        self.total_failed += 1
                        self._dead_letter_queue.append({
                            "event": event,
                            "reason": "HandlerMaxRetriesExceeded",
                            "timestamp": datetime.datetime.utcnow().isoformat()
                        })
                self._queue.task_done()
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"EventBus worker error: {e}")

    def start(self):
        if not self._running:
            if self._queue is None:
                self._queue = asyncio.Queue(maxsize=self._max_queue_size)
            self._running = True
            self._worker_task = asyncio.create_task(self._worker_loop())
            logger.info("EventBus background worker started.")

    def stop(self):
        self._running = False
        if self._worker_task:
            self._worker_task.cancel()

    def get_stats(self) -> Dict[str, Any]:
        return {
            "queue_depth": self._queue.qsize(),
            "total_ingested": self.total_ingested,
            "total_processed": self.total_processed,
            "total_failed": self.total_failed,
            "dead_letter_count": len(self._dead_letter_queue)
        }

event_bus = EventBus()
