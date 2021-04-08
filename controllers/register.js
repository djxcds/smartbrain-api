const handleRegister = (req, res, db, bcrypt) => {
        const { email, name, password } = req.body;

        if (!email || !name || !password) {
                return res.status(400).json('incorrect form submission');
        }

        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(password, salt);

        db.transaction(trx => {
                trx.insert({
                        hash,
                        email,
                })
                        .into('login')
                        .returning('email')
                        .then(loginEmail =>
                                trx('users')
                                        .returning('*')
                                        .insert({
                                                email: loginEmail[0],
                                                name,
                                                joined: new Date(),
                                        })
                                        .then(user => {
                                                res.json(user[0]);
                                        })
                        )
                        .then(trx.commit)
                        .catch(trx.rollback);
        }).catch(err => {
                console.log(err);
                res.status(400).json('Unable to register');
        });
};

module.exports = {
        handleRegister,
};
