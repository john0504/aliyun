import { AppActions } from '../actions/app-actions';
import { eq } from 'lodash';

export default function errors(state = [], action) {
    if (action.error) {
        return state.concat([action]);
    } else if (action.type === AppActions.REMOVE_ERROR) {
        return state.filter((error) => !eq(error, action.payload));
    }
    return state;
}
