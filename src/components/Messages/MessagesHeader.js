import React from "react";
import { Header, Segment, Input, Icon } from "semantic-ui-react";

class MessagesHeader extends React.Component {
  state = {
    privateChannel: this.props.privateChannel
  };

  componentDidMount() {
    window.addEventListener("keyup", this.focusSearchInput);
  }

  componentWillUnmount() {
    window.removeEventListener("keyup", this.focusSearchInput);
  }

  focusSearchInput = event => {
    const isInput = document.activeElement.nodeName === "INPUT";
    if (event.key === "/" && !isInput) {
      this.searchInputRef.focus();
    }
  };

  render() {
    const {
      channelName,
      handleSearchChange,
      uniqueUsers,
      searchLoading,
      handleStar,
      isStarred,
      privateChannel
    } = this.props;

    return (
      <Segment clearing>
        <Header fluid="true" as="h2" floated="left" style={{ marginBottom: 0 }}>
          <span>
            {channelName}{" "}
            {!privateChannel && (
              <Icon
                size="small"
                name={isStarred ? "star" : "star outline"}
                onClick={handleStar}
                color={isStarred ? "yellow" : "black"}
              />
            )}
          </span>
          <Header.Subheader>{uniqueUsers}</Header.Subheader>
        </Header>
        <Header floated="right">
          <Input
            loading={searchLoading}
            ref={c => (this.searchInputRef = c)}
            size="mini"
            icon="search"
            name="searchTerm"
            placeholder="Search messages"
            onChange={handleSearchChange}
          />
        </Header>
      </Segment>
    );
  }
}

export default MessagesHeader;
