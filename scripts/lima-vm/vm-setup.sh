#!/usr/bin/env bash
# S'exécute dans la VM Lima. Appelé par host-create-vm.sh.
# Variables d'environnement requises : PROJECT_DIR, HOST_HOME, VM_NAME

set -euo pipefail

sudo apt-get update -y
sudo apt-get install -y build-essential curl git gh

# Node.js 22 LTS (build du site Eleventy)
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs

sudo systemctl disable --now motd-news.timer # système d'annonces ubuntu

# Variable d'identification de la VM, sourcée à la fois par les shells interactifs
# (~/.bashrc) et par les shells non interactifs (via BASH_ENV) — utile pour les
# agents IA qui lancent des commandes avec `bash -c` sans passer par un shell de login.
cat > ~/.rdvsp-env.sh <<EOF
export RDVSP_DEVBOX=${VM_NAME}
EOF
echo 'source ~/.rdvsp-env.sh' >> ~/.bashrc
echo "BASH_ENV=$HOME/.rdvsp-env.sh" | sudo tee -a /etc/environment > /dev/null
source ~/.rdvsp-env.sh

# toujours ouvrir le terminal dans le repo
echo "cd $PROJECT_DIR" >> ~/.bashrc

# Installe Claude
curl -fsSL https://claude.ai/install.sh | bash
echo 'alias claude="claude --dangerously-skip-permissions"' >> ~/.bashrc
rm -rf ~/.claude && ln -s "$HOST_HOME/.claude" ~/.claude

