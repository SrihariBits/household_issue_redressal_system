import React, { Component } from 'react';
import './Home.css'
import FormLogin from '../Login/FormLogin'

class Home extends Component {
    constructor(props) {
        super(props);
        this.state = {
            users: 1,
            organizations: 2,
            freelancers: 5,
            issues: 7,
            usersEnd: 574,
            organizationsEnd: 27,
            freelancersEnd: 263,
            issuesEnd: 498,
        }
        // this.counter = this.counter.bind(this);
        // this.count = this.count.bind(this);
    }

    componentDidMount() {
        this.count();
    }
    
    counter = () => {
        if(this.state.users < this.state.usersEnd) {
            this.setState({users : this.state.users + 4})
        }
        if(this.state.organizations < this.state.organizationsEnd) {
            this.setState({organizations : this.state.organizations + 1})
        }
        if(this.state.freelancers < this.state.freelancersEnd) {
            this.setState({freelancers : this.state.freelancers + 5})
        }
        if(this.state.issues < this.state.issuesEnd) {
            this.setState({issues : this.state.issues + 5})
        }
    }

    count() {
        setInterval(()=> { this.counter() }, 30);
    }
    
    render() {
        let loginSection = <FormLogin setView={this.props.setView} setSigninStatus={this.props.setSigninStatus} />
        let { users,organizations,freelancers,issues } = this.state;

        return (
            <div id="home">
                <div id="headerPanel">
                    <h1>Household Issue Redressal System</h1>
                </div>
                <div id="infoLoginPanel" >
                    <div id="infoSection" >Hello. Matter goes in this section</div>
                    <span id="loginSection">{loginSection}</span>
                </div>
                <div id="statisicsPanel">
                    <span id="usersCount">
                        <h2>{users}</h2>
                        <h3>Total Users</h3>
                    </span>
                    <span id="organizationsCount">
                        <h2>{organizations}</h2>
                        <h3>Organizations</h3>
                    </span>
                    <span id="freelancersCount">
                        <h2>{freelancers}</h2>
                        <h3>FreeLancers</h3>
                    </span>
                    <span id="issuesCount">
                        <h2>{issues}</h2>
                        <h3>Issues</h3>
                    </span>
                </div>
            </div>
        );
    }
}

export default Home;