import time

from rq.queue import Queue

from worker.factories.redis import create_redis_client
from worker.settings import settings


redis_client = create_redis_client()
redis_queue = Queue(connection=redis_client)


def process_task(task):
    """This function processes a single task"""
    # For simplicity, we'll just print the task; this could be more complex
    print(f"Processing task: {task}")
    redis_queue.enqueue(task)

def worker():
    """Worker function to continually pull tasks from the Redis queue"""
    while True:
        try:
            # Pull a task from the Redis queue
            task = redis_client.lpop(settings.QUEUE_NAME)  # lpop pops the first item from the list

            if task:
                # If a task is available, process it
                process_task(task.decode('utf-8'))  # Decoding bytes to string
            else:
                print("No tasks in the queue. Waiting for new tasks...")
                time.sleep(5)  # Sleep for a bit before checking the queue again

        except Exception as e:
            print(f"Error processing task: {e}")
            time.sleep(5)  # Sleep before retrying in case of error

if __name__ == '__main__':
    print("Worker started...")
    worker()
