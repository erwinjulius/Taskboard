/**
 * AuthController
 *
 * @module      :: Controller
 * @description :: Contains logic for handling requests.
 */
var passport = require('passport');

module.exports = {
    /**
     * Login action, basically this just shows login screen.
     *
     * @param   {Request}   req Request object
     * @param   {Response}  res Response object
     */
    login: function(req, res) {
        var error = req.param("error");

        // If user is already signed in redirect to main page
        if (req.user) {
            res.redirect("/");
        }

        var fs = require('fs');
        var packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

        if (error) {
            res.status(401);
        }

        res.view({
            layout: "layout_login",
            error: error,
            packageJson: packageJson
        });
    },

    /**
     * Logout action, just logout user and then redirect to root.
     *
     * @param   {Request}   req Request object
     * @param   {Response}  res Response object
     */
    logout: function(req, res) {
        req.logout();
        res.redirect("/");
    },

    /**
     * Authentication action, this uses passport local directive to
     * check if user is valid user or not.
     *
     * @param req
     * @param res
     */
    authenticate: function(req, res) {
        passport.authenticate('local', function(error, user, info) {
            if ((error) || (!user)) {
                res.redirect("/login?error=true");

                return;
            }

            req.logIn(user, function(error) {
                if (error) {
                    res.view({
                        layout: "layout_login"
                    });
                } else {
                    // Write user sign in log
                    LoggerService.userSignIn(user, req);

                    res.redirect("/");
                }
            });
        })(req, res);
    }
};
