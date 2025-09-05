import { List, Datagrid, TextField, DateField, NumberField, FunctionField } from "react-admin";

const OrderList = () => (
  <List>
    <Datagrid rowClick="edit">
      <FunctionField
        label="ID"
        render={record => record.orderDisplayCode || record.id}
      />
      <TextField source="user.email" label="User Email" /> 
      <NumberField source="totalAmount" label="Total" />
      <TextField source="paymentMethod" label="Payment Method" />
      <TextField source="orderStatus" label="Order Status" />
      <DateField source="orderDate" label="Order Date" />
      <DateField source="expectedDeliveryDate" label="Expected Delivery" />
    </Datagrid>
  </List>
);

export default OrderList;
