# -*- mode: ruby -*-
# vi: set ft=ruby :

# Vagrantfile API/syntax version. Don't touch unless you know what you're doing!
VAGRANTFILE_API_VERSION = "2"

Vagrant.configure(VAGRANTFILE_API_VERSION) do |config|
  # All Vagrant configuration is done here. The most common configuration
  # options are documented and commented below. For a complete reference,
  # please see the online documentation at vagrantup.com.

  # Every Vagrant virtual environment requires a box to build off of.
  # We have already installed base box precise64 by running following
  # vagrant box add precise64 http://files.vagrantup.com/precise64.box
  config.vm.box = "ubuntu/trusty64"

  # Create a forwarded port mapping which allows access to a specific port
  # within the machine from a port on the host machine. In the example below,
  # accessing "localhost:8080" will access port 9090 on the guest machine.
  config.vm.network :forwarded_port, guest: 9090, host: 8080

  # Create a private network, which allows host-only access to the machine
  # using a specific IP.
  config.vm.network :private_network, ip: "33.33.33.10"

  # Share an additional folder to the guest VM. The first argument is
  # the path on the host to the actual folder. The second argument is
  # the path on the guest to mount the folder. And the optional third
  # argument is a set of non-required options.
  config.vm.synced_folder ".", "/vagrant", nfs: true
  
  config.vm.provider :cloudstack do |cloudstack, override|
    override.vm.box = "Ubuntu-16.04-SSH-Keys"
    cloudstack.scheme = "https"
    cloudstack.host = "sfucloud.ca"
    cloudstack.path = "/client/api"
    cloudstack.api_key = ENV['CLOUDSTACK_KEY'] || "AAAAAAAAAAAAAAAA"
    cloudstack.secret_key = ENV['CLOUDSTACK_SECRET'] || "AAAAAAAAAAAAAAAA"
    cloudstack.service_offering_name = "sc.t2.micro"
    cloudstack.zone_name = "NML-Zone"
    cloudstack.name = "cmpt470-#{File.basename(Dir.getwd)}-#{Random.new.rand(100)}"
    cloudstack.ssh_user = "ubuntu"
    cloudstack.security_group_names = ['CMPT 470 firewall']
  end

  # Enable provisioning with Puppet stand alone.  Puppet manifests
  # are contained in a directory path relative to this Vagrantfile.
  # You will need to create the manifests directory and a manifest in
  # the file precise64.pp in the manifests_path directory.

    config.vm.provision :shell do |shell| 
        shell.inline = "mkdir -p /etc/puppet/modules; 
        puppet module install --force puppetlabs-stdlib --version 4.17.1
        puppet module install --force willdurand-nodejs --version 2.0.0-alpha3;"
      end
  
  config.vm.provision :puppet
end
