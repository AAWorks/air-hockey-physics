from flask import Flask, render_template, request, session, redirect, url_for

app = Flask(__name__)
app.secret_key = 'physiscmakesmesad'

@app.route('/', methods=['GET','POST'])
def game():
    return render_template("game.html")

@app.route('/concepts', methods=['GET','POST'])
def concepts():
    return render_template("learnination.html")

@app.route('/win', methods=['GET','POST'])
def win():
    return render_template("win.html")

@app.route('/lose', methods=['GET','POST'])
def lose():
    return render_template("lose.html")

@app.route('/loading', methods=['GET', 'POST'])
def loading():
    return render_template("loading_page.html")

if __name__ == "__main__": #false if this file imported as module
    #enable debugging, auto-restarting of server when this file is modified
    app.debug = True
    app.run()