import { List, Datagrid, TextField, EmailField, ArrayField, SingleFieldList, ChipField } from 'react-admin';

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
                    <ChipField source="roleCode" />
                </SingleFieldList>
            </ArrayField>
        </Datagrid>
    </List>
);
