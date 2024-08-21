# projectFastBoots
* Goal is to unify available open data from gov and present these data to the general public so that they can make informed decisions in planning their route around SG
* additionally the weather information will allow users to see current information around them and Singapore as a whole to make proper outdoor plans.   
## Weather info
## Transport info
*   https://datamall.lta.gov.sg/content/datamall/en/dynamic-data.html#Traffic
### Routing
* Targomo
   * https://www.targomo.com/developers/resources/coverage/asia/
### Places
* FourSquares
   * https://location.foursquare.com/developer/

---
# Code snippit
```
class User extends Component {
    // ...

    getUserData = () => axios.get(`${ROOT_URL}/profile/${this.props.activeUserId}`);

    getPermissions = () => axios.get(`${ROOT_URL}/permissions/${this.props.activeUserId}`);

    async componentDidMount() {
        try {
            const [userData, userPermissions] = await axios.all([ this.getUserData(), this.getPermissions() ]);
            this.setState(
                user: {
                    data: userData.data,
                    permissions: userPermissions.data
                }
            );
        }
        catch (err) {
            console.log(err.message);
        }
        
    }

    // ...
}
```