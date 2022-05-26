from flask import Flask, render_template, request, session, redirect, url_for

app = Flask(__name__)
app.secret_key = 'physiscmakesmesad'

defaults = {"puckmass" : 15.0, 
    "fric": 0.001, 
    "playermass": 45.0,
    "height": 550,
    "width": 800,
    "player_r": 45,
    "puck_r": 35}

@app.route('/', methods=['GET','POST'])
def game():
    default_vals = [defaults["puckmass"], defaults["fric"], defaults['playermass']]
    if request.method == 'POST':          
        values = [request.form['mass'], request.form['fric'], request.form['player_mass']]
        for i in range(len(values)):
            if values[i].isalpha() or values[i] == "":
                print("happening")
                values[i] = default_vals[i]
            else:
                values[i] = float(values[i])
        if values[1] > 0.05:
           values[1] = 0.05
        return render_template("game.html", puck_mass = values[0], fric = values[1], player_mass=values[2], h=defaults["height"], w=defaults["width"], puck_r=defaults["puck_r"], player_r=defaults["player_r"])
    return render_template("game.html", puck_mass=defaults["puckmass"], fric=defaults["fric"], player_mass=defaults["playermass"], h=defaults['height'], w=defaults['width'], puck_r=defaults["puck_r"], player_r=defaults["player_r"])

@app.route('/competitive', methods=['GET','POST'])
def competitive():
    return render_template("single_player.html", puck_mass=defaults["puckmass"], fric=defaults["fric"], player_mass=defaults["playermass"], h=defaults['height'], w=defaults['width'], puck_r=defaults["puck_r"], player_r=defaults["player_r"])

@app.route('/concepts', methods=['GET','POST'])
def concepts():
    return render_template("learnination.html")

@app.route('/win', methods=['GET','POST'])
def win():
    return render_template("win.html")

@app.route('/lose', methods=['GET','POST'])
def lose():
    return render_template("lose.html")

@app.route('/win_comp', methods=['GET','POST'])
def win_comp():
    return render_template("win_comp.html")

@app.route('/lose_comp', methods=['GET','POST'])
def lose_comp():
    return render_template("lose_comp.html")

@app.route('/loading', methods=['GET', 'POST'])
def loading():
    return render_template("loading_page.html")

if __name__ == "__main__": #false if this file imported as module
    #enable debugging, auto-restarting of server when this file is modified
    app.debug = True
    app.run()