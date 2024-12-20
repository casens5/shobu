from flask import Flask 
app = Flask(__name__)

@app.route('/api/baba', methods=['GET'])
def baba():
    return "<p>baba!</p>"

if __name__ == '__main__':
    app.run(port=5328)
