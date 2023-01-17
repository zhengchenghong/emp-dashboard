## Codebase Guidance

### 1. Code Stack

- #### [React.js](https://reactjs.org/)
- #### [React Apollo](https://www.apollographql.com/docs/react/)
- #### [Material-UI](https://material-ui.com/)

### 2. Description

We are using React.js based on React Hook and components.
All components are registered inside of /src/components.

Currently, the project was created by create-react-app and using Material UI. All styling is following the Material types.

- Global configuration.

1. Alias => we don't use this character to point the components "../../components/". In this case we can use alias simply "@app/components"
   > @app => /src, @public => /public

```javascript
import AppRouter from '@app/router'; // right!
import AppRouter from '../router'; // bad
```

2. Graphql => All Graphql features are stored inside of /src/graphql and use the \*/gql file for defining the fragments, mutations, queries, subscriptions.
3. Multiple components inside of components => We are using the index.js for the quick link...

```javascript
export { default as DescriptionForm } from './Description';
```

> NOTE: If you are going to create new component, then **props** should be resolved

```javascript
const DemoComponent = (props) => {}; // bad
const DemoComponent = ({ parameter1, parameter2, function1, function2 }) => {}; // right!
```

> NOTE: Component name should be meaningful to make sure another developer

```javascript
const Inputarea; //bad
const editableInput; //bad
const DropdownMenu; //good
```

> NOTE: we are following the camelcase for defining the variables/functions.

```javascript
const GetDropDownMenu = () => {}; //bad
const getDropDownMenu = () => {}; //good
let TestData; //bad
let testData; //good.
```

> NOTE: we are using ES6, so if there are no misunderstanding, follow this [link](http://es6-features.org/#Constants)
