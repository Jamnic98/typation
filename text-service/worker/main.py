import redis
import time

# Configure the connection to Redis
redis_host = 'redis'  # Assuming Redis service is named 'redis' in your docker-compose.yml
redis_port = 6379  # Default Redis port
queue_name = 'task_queue'  # Name of the Redis queue to pull tasks from

# Connect to the Redis server
r = redis.Redis(host=redis_host, port=redis_port, db=0)

def process_task(task):
    """This function processes a single task"""
    # For simplicity, we'll just print the task; this could be more complex
    print(f"Processing task: {task}")

def worker():
    """Worker function to continually pull tasks from the Redis queue"""
    while True:
        try:
            # Pull a task from the Redis queue
            task = r.lpop(queue_name)  # lpop pops the first item from the list

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
