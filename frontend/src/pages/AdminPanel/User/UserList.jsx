import { List, Datagrid, TextField, EmailField, ArrayField, SingleFieldList, FunctionField } from 'react-admin';

export const UserList = () => (
    <List>
        <Datagrid rowClick="edit">
            <TextField source="id" />
            <TextField source="firstName" />
            <TextField source="lastName" />
            <EmailField source="email" />
            <TextField source="phoneNumber" />
            <ArrayField source="authorityList">
                <SingleFieldList>
                    <FunctionField render={record => record} />  {/* render trực tiếp string */}
                </SingleFieldList>
            </ArrayField>
        </Datagrid>
    </List>
);
