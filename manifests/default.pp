# Update first

exec { 'MongoDB public key':
    user => 'root',
    path => ['/bin', '/usr/bin'],
    command => "sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 0C49F3730359A14518585931BC711F9BA15703C6",
}

exec { 'MongoDB list':
    path => ['/bin', '/usr/bin'],
    user => 'root',
    command => "echo 'deb [ arch=amd64 ] http://repo.mongodb.org/apt/ubuntu trusty/mongodb-org/3.4 multiverse' | sudo tee /etc/apt/sources.list.d/mongodb-org-3.4.list",
}

exec { 'apt-get update':
  command => '/usr/bin/apt-get update'
}


class { 'nodejs':
  version => 'v6.0.0',
}

package { 'grunt':
  provider => 'npm',
  require  => Class["nodejs"],
}

package { 'less':
  provider => 'npm',
  require  => Class["nodejs"],
}

package { 'express':
  provider => 'npm',
  require  => Class['nodejs']
}

exec { 'MongoDB install':
    path => ['/bin', '/usr/bin'],
    command => 'sudo apt-get install -y mongodb-org'
}

exec { 'nginx install':
    path => ['/bin', '/usr/bin'],
    command => 'sudo apt-get install -y nginx'
}

exec { 'npm install express':
    cwd => '/vagrant/app',
    command => 'npm install --save express --no-bin-links;',
    user => 'root',
    path => ['/usr/local/node/node-default/bin', '/bin', '/usr/bin']
}

exec { 'npm install':
    cwd => '/vagrant/app',
    command => 'npm install -g nodemon;
                npm install --save body-parser multer --no-bin-links;
                npm install --save ejs --no-bin-links;
                npm install --save mongoose --no-bin-links;
                npm install --save cookie-parser --no-bin-links;
                npm install --save express-session --no-bin-links;
                npm install --save randomstring --no-bin-links;
                npm install --save passport --no-bin-links;
                npm install --save passport-local --no-bin-links;
                npm install --save bcrypt-nodejs --no-bin-links;
                npm install --save socket.io --no-bin-links',
    user => 'root',
    path => ['/usr/local/node/node-default/bin', '/bin', '/usr/bin']
}

exec { 'select database':
    path => ['/bin', '/usr/bin'],
    cwd => '/vagrant/app',
    command => 'mongo < db-setup.js'
}

exec { 'configure nginx':
    path => ['/bin', '/usr/bin'],
    command => 'sudo ufw allow "Nginx HTTP"; sudo cp /vagrant/default /etc/nginx/sites-available/default;'
}

exec { 'start node server':
    path => ['/usr/local/node/node-default/bin', '/bin', '/usr/bin', '/usr/local/bin'],
    cwd => '/vagrant/app',
    command => 'nohup nodemon index.js &'
}

exec { 'restart nginx':
    path => ['/bin', '/usr/bin', '/etc/init.d'],
    command => 'sudo service nginx restart'
}


Exec['MongoDB public key'] 
-> Exec['MongoDB list']
-> Exec['apt-get update'] 
-> Class['nodejs'] 
-> Exec['MongoDB install']
-> Exec['nginx install']
-> Exec['npm install express']
-> Exec['npm install']
-> Exec['select database']
-> Exec['configure nginx']
-> Exec['start node server']
-> Exec['restart nginx']