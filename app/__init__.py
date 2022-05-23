from flask import Flask, render_template, request, session, redirect, url_for

app = Flask(__name__)
app.secret_key = 'physiscmakesmesad'

@app.route('/', methods=['GET','POST'])
def game():
    defaults = [15.0, 0.01, 1.0]
    if request.method == 'POST':          
        values = [request.form['mass'], request.form['fric'], request.form['acceleration']]
        for i in range(len(values)):
            if values[i].isalpha or values[i] == "":
                values[i] = defaults[i]
            else:
                values[i] = float(values[i])
        return render_template("game.html", mass = values[0], fric = values[1], a = values[2])
    return render_template("game.html", mass=defaults[0], fric=defaults[1], a=defaults[2])

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