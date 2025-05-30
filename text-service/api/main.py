from app.factories.fastapi_app import create_app

app, _ = create_app()


if __name__ == '__main__':
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=5000, reload=True)
