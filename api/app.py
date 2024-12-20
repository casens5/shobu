from flask import Flask 
app = Flask(__name__)

@app.route('/api/baba')
def baba():
    return "<p>baba!</p>"
