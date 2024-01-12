import Account from "./Account";

type Task = {
  id: string;
  name: string;
  categoryId: string;
  isCompleted: boolean;
  account: Account;
};

export default Task;
