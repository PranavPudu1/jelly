interface UUID {};
interface Restaurant {};

interface User {
    id: UUID;
    phone: string;
    
    name?: string;
    email?: string;
    password?: string;
}

// TODO: How do we store temporary preferences (questionnaire screen)

/*
TODO: Many to one or one to many? Store each prefernce as it's own object or as a list of Tags?
    - List of tags would be helpful

    User -> UserPreference -> Tag
*/
interface UserPreferences {

}

/*
TODO: How do we want to organize user interactions

- Need to store swipe and navigation (did they view the map, etc) information
- Need to easily get a list of the saved restaurants

! If we allow users to delete saved restaurants from their view:
SavedRestaurant:
////

*/

interface UserInteraction {
    id: UUID;
    session: Session;

    // TODO: Do we consider scroll?
    type: string; //! SWIPE_LEFT, SWIPE_RIGHT, LEFT 
    restaurant: Restaurant;
}

interface Session {
    id: UUID;
    user: User;
    started: Date;
    ended: Date | null;
}
