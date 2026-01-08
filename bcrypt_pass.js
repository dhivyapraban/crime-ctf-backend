const bcrypt = require('bcrypt');
bcrypt.hash('detective123', 10).then(hash => console.log(hash));