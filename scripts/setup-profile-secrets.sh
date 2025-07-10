#!/bin/bash

set -ex pipefail

# This script is used to setup fly secrets to hold profile information.
# They are not really secrets, but fly only holds environment variables as secrets.
fly secrets set GITHUB_PROFILE_URL=https://github.com/beverage \
                LINKEDIN_PROFILE_URL=https://linkedin.com/in/mrbeverage \
                INSTAGRAM_PROFILE_URL=https://instagram.com/beverage \
                CONTACT_EMAIL_ADDRESS=nobody@nobody.com \
