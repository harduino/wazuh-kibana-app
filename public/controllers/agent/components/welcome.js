/*
 * Wazuh app - React component building the welcome screen of an agent.
 * version, OS, registration date, last keep alive.
 *
 * Copyright (C) 2015-2019 Wazuh, Inc.
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * Find more information about this on the LICENSE file.
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  EuiCard,
  EuiIcon,
  EuiPanel,
  EuiFlexItem,
  EuiFlexGroup,
  EuiSpacer,
  EuiSwitch,
  EuiPopover,
  EuiButtonIcon,
  EuiFormRow,
  EuiFlexGrid,
  EuiCallOut
} from '@elastic/eui';

import { TabDescription } from '../../../../server/reporting/tab-description';
import { UnsupportedComponents } from '../../../utils/components-os-support';
import mitreSvg from '../../../img/icons/mitre.svg';
import virustotalSvg from '../../../img/icons/virustotal.svg';
import ciscatSvg from '../../../img/icons/cis.svg';
import hipaaSvg from '../../../img/icons/hipaa.svg';
import gdprSvg from '../../../img/icons/gdpr.svg';
import pciSvg from '../../../img/icons/pci.svg';
import nistSvg from '../../../img/icons/nist.svg';


export class WelcomeScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      extensions: this.props.extensions
    };
  }

  onButtonClick(btn) {
    this.setState({
      [btn]: !this.state[btn]
    });
  }

  closePopover(popover) {
    this.setState({
      [popover]: false
    });
  }

  toggleExtension(extension) {
    const extensions = this.state.extensions;
    extensions[extension] = !extensions[extension];
    this.setState({
      extensions
    });
    try {
      const api = JSON.parse(this.props.api).id;
      api && this.props.setExtensions(api, extensions);
    } catch (error) {} //eslint-disable-line
  }

  buildTabCard(tab, icon) {
    return (
      <EuiFlexItem>
        <EuiCard
          layout="horizontal"
          icon={<EuiIcon size="xl" type={icon} />}
          title={TabDescription[tab].title}
          onClick={() => this.props.switchTab(tab)}
          description={TabDescription[tab].description}
        />
      </EuiFlexItem>
    );
  }

  buildPopover(popoverName, extensions) {
    const switches = extensions
      .filter(extension => this.props.extensions[extension] !== undefined)
      .map(extension => {
        return (
          <EuiFormRow key={extension}>
            <EuiSwitch
              label={`${TabDescription[extension].title} extension`}
              checked={this.state.extensions[extension]}
              onChange={() => this.toggleExtension(extension)}
            />
          </EuiFormRow>
        );
      });

    return (
      <EuiPopover
        id={popoverName}
        button={
          <EuiButtonIcon
            aria-label="Extensions"
            iconType="eye"
            onClick={() => this.onButtonClick(popoverName)}
          />
        }
        isOpen={this.state[popoverName]}
        closePopover={() => this.closePopover(popoverName)}
      >
        {switches}
      </EuiPopover>
    );
  }

  render() {
    return (
      <div>
        <EuiFlexGroup>
          <EuiFlexItem>
            <EuiPanel betaBadgeLabel="Security Information Management">
              <EuiSpacer size="l" />
              <EuiFlexGrid columns={2}>
                {this.buildTabCard('general', 'dashboardApp')}
                {this.buildTabCard('fim', 'loggingApp')}
                {this.buildTabCard('configuration', 'gear')}
                {this.buildTabCard('syscollector', 'notebookApp')}
              </EuiFlexGrid>
            </EuiPanel>
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiPanel betaBadgeLabel="Auditing and Policy Monitoring">
              <EuiFlexGroup gutterSize="xs">
                <EuiFlexItem />
                <EuiFlexItem grow={false}>
                  {this.buildPopover('popoverAuditing', [
                    'audit',
                    'oscap',
                    'ciscat'
                  ])}
                </EuiFlexItem>
              </EuiFlexGroup>
              <EuiFlexGrid columns={2}>
                {this.buildTabCard('pm', 'advancedSettingsApp')}
                {this.buildTabCard('sca', 'securityAnalyticsApp')}
                {this.props.extensions.audit &&
                  this.buildTabCard('audit', 'monitoringApp')}
                {this.props.extensions.oscap &&
                  this.buildTabCard('oscap', 'codeApp')}
                {this.props.extensions.ciscat &&
                  this.buildTabCard('ciscat', ciscatSvg)}
              </EuiFlexGrid>
            </EuiPanel>
          </EuiFlexItem>
        </EuiFlexGroup>

        <EuiSpacer size="xl" />
        <EuiFlexGroup>
          <EuiFlexItem>
            <EuiPanel betaBadgeLabel="Threat Detection and Response">
              <EuiFlexGroup gutterSize="xs">
                <EuiFlexItem />
                <EuiFlexItem grow={false}>
                  {this.buildPopover('popoverThreat', [
                    'virustotal',
                    'osquery',
                    'docker',
                    'mitre'
                  ])}
                </EuiFlexItem>
              </EuiFlexGroup>
              {(
                UnsupportedComponents[this.props.agent.agentPlatform] ||
                UnsupportedComponents['other']
              ).includes('vuls') &&
                !this.props.extensions.virustotal &&
                !this.props.extensions.osquery &&
                !this.props.extensions.mitre &&
                !this.props.extensions.docker && (
                  <EuiFlexGroup>
                    <EuiFlexItem>
                      <EuiCallOut
                        title={
                          <p>
                            Click the <EuiIcon type="eye" /> icon to show thread
                            detection and response extensions.
                          </p>
                        }
                        color="success"
                        iconType="help"
                      />
                    </EuiFlexItem>
                  </EuiFlexGroup>
                )}
              <EuiFlexGrid columns={2}>
                {!(
                  UnsupportedComponents[this.props.agent.agentPlatform] ||
                  UnsupportedComponents['other']
                ).includes('vuls') && this.buildTabCard('vuls', 'securityApp')}
                {this.props.extensions.virustotal &&
                  this.buildTabCard('virustotal', virustotalSvg)}
                {this.props.extensions.osquery &&
                  this.buildTabCard('osquery', 'logoOsquery')}
                {this.props.extensions.docker &&
                  this.buildTabCard('docker', 'spacesApp')}
                {this.props.extensions.mitre &&
                  this.buildTabCard('mitre', mitreSvg)} {/* TODO- Change "spacesApp" icon*/}
              </EuiFlexGrid>
            </EuiPanel>
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiPanel betaBadgeLabel="Regulatory Compliance">
              <EuiFlexGroup gutterSize="xs">
                <EuiFlexItem />
                <EuiFlexItem grow={false}>
                  {this.buildPopover('popoverRegulatory', [
                    'pci',
                    'gdpr',
                    'hipaa',
                    'nist'
                  ])}
                </EuiFlexItem>
              </EuiFlexGroup>
              {!this.props.extensions.pci &&
                !this.props.extensions.gdpr &&
                !this.props.extensions.hipaa &&
                !this.props.extensions.nist && (
                  <EuiFlexGroup>
                    <EuiFlexItem>
                      <EuiCallOut
                        title={
                          <p>
                            Click the <EuiIcon type="eye" /> icon to show
                            regulatory compliance extensions.
                          </p>
                        }
                        color="success"
                        iconType="help"
                      />
                    </EuiFlexItem>
                  </EuiFlexGroup>
                )}
              {(this.props.extensions.pci ||
                this.props.extensions.gdpr ||
                this.props.extensions.hipaa ||
                this.props.extensions.nist) && (
                <EuiFlexGrid columns={2}>
                  {this.props.extensions.pci &&
                    this.buildTabCard('pci', pciSvg)}
                  {this.props.extensions.gdpr &&
                    this.buildTabCard('gdpr', gdprSvg)}
                  {this.props.extensions.hipaa &&
                    this.buildTabCard('hipaa', hipaaSvg)}
                  {this.props.extensions.nist &&
                    this.buildTabCard('nist', nistSvg)}
                </EuiFlexGrid>
              )}
            </EuiPanel>
          </EuiFlexItem>
        </EuiFlexGroup>
      </div>
    );
  }
}

WelcomeScreen.propTypes = {
  extensions: PropTypes.object,
  agent: PropTypes.object,
  setExtensions: PropTypes.func,
  switchTab: PropTypes.func,
  api: PropTypes.string
};
