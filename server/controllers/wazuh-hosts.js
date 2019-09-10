/*
 * Wazuh app - Class for Wazuh-API functions
 * Copyright (C) 2015-2019 Wazuh, Inc.
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * Find more information about this on the LICENSE file.
 */

import { ManageHosts } from '../lib/manage-hosts';
import { UpdateRegistry } from '../lib/update-registry';
import { log } from '../../server/logger';
import { ErrorResponse } from './error-response';

export class WazuhHostsCtrl {
  constructor() {
    this.manageHosts = new ManageHosts();
    this.updateRegistry = new UpdateRegistry();
  }

  /**
   * This get all hosts entries in the wazuh-hosts.yml and the related info in the wazuh-registry.json
   * @param {Object} req
   * @param {Object} reply
   * API entries or ErrorResponse
   */
  async getHostsEntries(req, reply) {
    try {
      const hosts = await this.manageHosts.getHosts();
      const registry = await this.updateRegistry.getHosts();
      return this.joinHostRegistry(hosts, registry);
    } catch (error) {
      log('wazuh-hosts:getHostsEntries', error.message || error);
      return ErrorResponse(error.message || error, 2001, 500, reply);
    }
  }

  /**
   * Ofuscate the password
   * @param {Array} hosts 
   */
  ofuscatePassword(hosts) {
    try {
      const ofuscated = hosts.map(h => {
        const id = Object.keys(h)[0];
        h[id].password = '******';
        return h;
      });
      return ofuscated;
    } catch (error) {
      throw new Error(error);
    }
  }

  /**
   * Joins the hosts with the related information in the registry
   * @param {Object} hosts 
   * @param {Object} registry 
   */
  joinHostRegistry(hosts, registry) {
    try {
      const ofuscated = this.ofuscatePassword(hosts);
      ofuscated.forEach(h => {
        const id = Object.keys(h)[0];
        Object.assign(h[id], registry[id]);
      });
      return ofuscated;
    } catch (error) {
      throw new Error(error);
    }
  }

  /**
 * This update an API hostname
 * @param {Object} req
 * @param {Object} reply
 * Status response or ErrorResponse
 */
  async updateAPIHostname(req, reply) {
    try {
      const id = req.params.id;
      await this.updateRegistry.updateAPIHostname(id, req.payload.cluster_info);
      log(
        'wazuh-hosts:updateAPIHostname',
        `API entry ${req.params.id} hostname updated`,
        'debug'
      );
      return { statusCode: 200, message: 'ok' };
    } catch (error) {
      log('wazuh-hosts:updateAPIHostname', error.message || error);
      return ErrorResponse(
        `Could not update data in wazuh-registry.json due to ${error.message || error}`,
        2012,
        500,
        reply
      );
    }
  }
}
