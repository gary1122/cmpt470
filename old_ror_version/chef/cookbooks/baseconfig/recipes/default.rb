# Make sure the Apt package lists are up to date, so we're downloading versions that exist.
cookbook_file "apt-sources.list" do
  path "/etc/apt/sources.list"
end
execute 'apt_update' do
  command 'apt-get update'
end

# Base configuration recipe in Chef.
package "wget"
package "ntp"
cookbook_file "ntp.conf" do
  path "/etc/ntp.conf"
end
execute 'ntp_restart' do
  command 'service ntp restart'
end

#nginx
package "nginx"

cookbook_file "nginx-default" do
  path "/etc/nginx/sites-available/default"
end

execute 'nginx_restart' do
 command "service nginx reload"
end



package "ruby-dev"
package "sqlite3"
package "libsqlite3-dev"
package "zlib1g-dev"
package "nodejs"
package "build-essential"
package "libpq-dev"
gem_package "nokogiri"


execute 'bundler install' do 
 command 'gem install bundler --conservative'
end

execute 'bundle' do
 command 'bundle install'
 cwd '/home/ubuntu/project/finalproject'
 user 'ubuntu'
end

#postgresql
package "postgresql"
execute 'postgresql_setup' do
  command 'echo "CREATE DATABASE mydb; CREATE USER ubuntu; GRANT ALL PRIVILEGES ON DATABASE mydb TO ubuntu;" | sudo -u postgres psql'
end

execute 'migrate' do
  command 'rake db:migrate'
  cwd '/home/ubuntu/project/finalproject'
  user 'ubuntu'
end


execute 'migrate' do 
 command 'rails server -d -b 0.0.0.0'
 cwd '/home/ubuntu/project/finalproject'
 user 'ubuntu'
end










