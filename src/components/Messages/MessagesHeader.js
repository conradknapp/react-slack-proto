import React from "react";
import { connect } from "react-redux";
import { Header, Segment, Input, Icon } from "semantic-ui-react";

class MessagesHeader extends React.Component {
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
      channel,
      handleSearchChange,
      uniqueUsers,
      searchLoading,
      handleStar,
      isStarred
    } = this.props;

    return (
      <Segment clearing>
        <Header fluid="true" as="h2" floated="left" style={{ marginBottom: 0 }}>
          <span>
            {channel}{" "}
            <Icon
              size="small"
              name={isStarred ? "star" : "star outline"}
              onClick={handleStar}
              color={isStarred ? "yellow" : "black"}
            />
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

const mapStateToProps = state => ({
  currentChannel: state.channel.currentChannel
});

export default connect(mapStateToProps)(MessagesHeader);
