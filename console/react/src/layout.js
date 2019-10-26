/*
Licensed to the Apache Software Foundation (ASF) under one
or more contributor license agreements.  See the NOTICE file
distributed with this work for additional information
regarding copyright ownership.  The ASF licenses this file
to you under the Apache License, Version 2.0 (the
"License"); you may not use this file except in compliance
with the License.  You may obtain a copy of the License at

  http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing,
software distributed under the License is distributed on an
"AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, either express or implied.  See the License for the
specific language governing permissions and limitations
under the License.
*/

import React from "react";
import {
  Avatar,
  Button,
  ButtonVariant,
  Dropdown,
  DropdownToggle,
  DropdownItem,
  Page,
  PageHeader,
  SkipToContent,
  Toolbar,
  ToolbarGroup,
  ToolbarItem,
  Nav,
  NavExpandable,
  NavItem,
  NavList,
  PageSidebar
} from "@patternfly/react-core";

import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  Redirect
} from "react-router-dom";

import accessibleStyles from "@patternfly/patternfly/utilities/Accessibility/accessibility.css";
import { css } from "@patternfly/react-styles";
import { BellIcon, PowerOffIcon } from "@patternfly/react-icons";
//import ConnectForm from "./connect-form";
import ConnectPage from "./connectPage";
import DashboardPage from "./overview/dashboard/dashboardPage";
import OverviewTablePage from "./overview/overviewTablePage";
import DetailsTablePage from "./overview/detailsTablePage";
import TopologyPage from "./topology/topologyPage";
import MessageFlowPage from "./chord/qdrChord";
import LogDetails from "./overview/logDetails";
import { QDRService } from "./qdrService";
import ConnectForm from "./connect-form";
const avatarImg = require("./assets/img_avatar.svg");

class PageLayout extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      connected: false,
      connectPath: "",
      isDropdownOpen: false,
      activeGroup: "overview",
      activeItem: "dashboard",
      isConnectFormOpen: false,
      isNavOpenDesktop: true,
      isNavOpenMobile: false,
      isMobileView: false
    };
    this.hooks = { setLocation: this.setLocation };
    this.service = new QDRService(this.hooks);
    this.nav = {
      overview: [
        { name: "dashboard" },
        { name: "routers", pre: true },
        { name: "addresses", pre: true },
        { name: "links", pre: true },
        { name: "connections", pre: true },
        { name: "logs", pre: true }
      ],
      visualizations: [
        { name: "topology" },
        { name: "flow", title: "Message flow" }
      ],
      details: [{ name: "entities" }, { name: "schema" }]
    };
  }

  setLocation = where => {
    //this.setState({ connectPath: where })
  };

  onDropdownToggle = isDropdownOpen => {
    this.setState({
      isDropdownOpen
    });
  };

  onDropdownSelect = event => {
    this.setState({
      isDropdownOpen: !this.state.isDropdownOpen
    });
  };

  handleConnect = (connectPath, connectInfo) => {
    if (this.state.connected) {
      this.setState(
        { connectPath: "", connected: false, isConnectFormOpen: false },
        () => {
          this.service.disconnect();
        }
      );
    } else {
      const connectOptions = JSON.parse(JSON.stringify(connectInfo));
      if (connectOptions.username === "") connectOptions.username = undefined;
      if (connectOptions.password === "") connectOptions.password = undefined;
      connectOptions.reconnect = true;

      this.service.connect(connectOptions).then(
        r => {
          if (connectPath === "/") connectPath = "/dashboard";
          const activeItem = connectPath.split("/").pop();
          // find the active group for this item
          let activeGroup = "overview";
          for (const group in this.nav) {
            if (this.nav[group].some(item => item.name === activeItem)) {
              activeGroup = group;
              break;
            }
          }

          this.setState({
            isConnectFormOpen: false,
            activeItem,
            activeGroup,
            connected: true,
            connectPath
          });
        },
        e => {
          console.log(e);
        }
      );
    }
  };

  onNavSelect = result => {
    this.setState({
      activeItem: result.itemId,
      activeGroup: result.groupId,
      connectPath: ""
    });
  };
  icap = s => s.charAt(0).toUpperCase() + s.slice(1);

  toggleConnectForm = event => {
    this.setState({ isConnectFormOpen: !this.state.isConnectFormOpen });
  };

  handleConnectCancel = () => {
    this.setState({ isConnectFormOpen: false });
  };

  onNavToggleDesktop = () => {
    this.setState({
      isNavOpenDesktop: !this.state.isNavOpenDesktop
    });
  };

  onNavToggleMobile = () => {
    this.setState({
      isNavOpenMobile: !this.state.isNavOpenMobile
    });
  };

  onPageResize = ({ mobileView, windowSize }) => {
    this.setState({
      isMobileView: mobileView
    });
  };

  render() {
    const { isDropdownOpen, activeItem, activeGroup } = this.state;
    const { isNavOpenDesktop, isNavOpenMobile, isMobileView } = this.state;

    const PageNav = (
      <Nav onSelect={this.onNavSelect} aria-label="Nav" className="pf-m-dark">
        <NavList>
          {Object.keys(this.nav).map(section => {
            const Section = this.icap(section);
            return (
              <NavExpandable
                title={Section}
                groupId={section}
                isActive={activeGroup === section}
                isExpanded
                key={section}
              >
                {this.nav[section].map(item => {
                  const key = item.name;
                  return (
                    <NavItem
                      groupId={section}
                      itemId={key}
                      isActive={activeItem === key}
                      key={key}
                    >
                      <Link to={`/${item.pre ? section + "/" : ""}${key}`}>
                        {item.title ? item.title : this.icap(key)}
                      </Link>
                    </NavItem>
                  );
                })}
              </NavExpandable>
            );
          })}
        </NavList>
      </Nav>
    );
    const userDropdownItems = [
      <DropdownItem component="button" key="action">
        Logout
      </DropdownItem>
    ];
    const PageToolbar = (
      <Toolbar>
        <ToolbarGroup
          className={css(
            accessibleStyles.screenReader,
            accessibleStyles.visibleOnLg
          )}
        >
          <ToolbarItem>
            <Button
              id="connectButton"
              onClick={this.toggleConnectForm}
              aria-label="Toggle Connect Form"
              variant={ButtonVariant.plain}
            >
              <PowerOffIcon />
            </Button>
          </ToolbarItem>
          <ToolbarItem>
            <Button
              id="default-example-uid-01"
              aria-label="Notifications actions"
              variant={ButtonVariant.plain}
            >
              <BellIcon />
            </Button>
          </ToolbarItem>
        </ToolbarGroup>
        <ToolbarGroup>
          <ToolbarItem
            className={css(
              accessibleStyles.screenReader,
              accessibleStyles.visibleOnMd
            )}
          >
            <Dropdown
              isPlain
              position="right"
              onSelect={this.onDropdownSelect}
              isOpen={isDropdownOpen}
              toggle={
                <DropdownToggle onToggle={this.onDropdownToggle}>
                  anonymous
                </DropdownToggle>
              }
              dropdownItems={userDropdownItems}
            />
          </ToolbarItem>
        </ToolbarGroup>
      </Toolbar>
    );

    const Header = (
      <PageHeader
        className="topology-header"
        logo={<span className="logo-text">Apache Qpid Dispatch Console</span>}
        toolbar={PageToolbar}
        avatar={<Avatar src={avatarImg} alt="Avatar image" />}
        showNavToggle
        onNavToggle={
          isMobileView ? this.onNavToggleMobile : this.onNavToggleDesktop
        }
        isNavOpen={isMobileView ? isNavOpenMobile : isNavOpenDesktop}
      />
    );
    const pageId = "main-content-page-layout-manual-nav";
    const PageSkipToContent = (
      <SkipToContent href={`#${pageId}`}>Skip to Content</SkipToContent>
    );

    const sidebar = PageNav => {
      if (this.state.connected) {
        return (
          <PageSidebar
            nav={PageNav}
            isNavOpen={isMobileView ? isNavOpenMobile : isNavOpenDesktop}
            theme="dark"
          />
        );
      }
      return <React.Fragment />;
    };

    // don't allow access to this component unless we are logged in
    const PrivateRoute = ({ component: Component, path: rpath, ...more }) => (
      <Route
        path={rpath}
        {...(more.exact ? "exact" : "")}
        render={props =>
          this.state.connected ? (
            <Component service={this.service} {...props} {...more} />
          ) : (
            <Redirect
              to={{ pathname: "/login", state: { from: props.location } }}
            />
          )
        }
      />
    );

    // When we need to display a different component(page),
    // we render a <Redirect> object
    const redirectAfterConnect = () => {
      let { connectPath } = this.state;
      if (connectPath !== "") {
        if (connectPath === "/login") connectPath = "/";
        return <Redirect to={connectPath} />;
      }
      return <React.Fragment />;
    };

    const connectForm = () => {
      if (this.state.isConnectFormOpen) {
        return (
          <ConnectForm
            fromPath={"/"}
            handleConnect={this.handleConnect}
            handleConnectCancel={this.handleConnectCancel}
            isConnected={this.state.connected}
          />
        );
      }
      return <React.Fragment />;
    };

    return (
      <Router>
        {redirectAfterConnect()}
        <Page
          header={Header}
          sidebar={sidebar(PageNav)}
          onPageResize={this.onPageResize}
          skipToContent={PageSkipToContent}
          mainContainerId={pageId}
        >
          {connectForm()}
          <Switch>
            <PrivateRoute path="/" exact component={DashboardPage} />
            <PrivateRoute path="/dashboard" component={DashboardPage} />
            <PrivateRoute
              path="/overview/:entity"
              component={OverviewTablePage}
            />
            <PrivateRoute path="/details" component={DetailsTablePage} />
            <PrivateRoute path="/topology" component={TopologyPage} />
            <PrivateRoute path="/flow" component={MessageFlowPage} />
            <PrivateRoute path="/logs" component={LogDetails} />
            <Route
              path="/login"
              render={props => (
                <ConnectPage {...props} handleConnect={this.handleConnect} />
              )}
            />
          </Switch>
        </Page>
      </Router>
    );
  }
}

export default PageLayout;

/*          <ToolbarItem>
            <ConnectForm prefix="toolbar" handleConnect={this.handleConnect} />
          </ToolbarItem>

          */
