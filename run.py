from app import create_app

app = create_app()
if __name__ == '__main__':
    # DO NOT RUN ON PRODUCTION
    # use `gunicorn wsgi:app` instead
    app.run(debug=True)
