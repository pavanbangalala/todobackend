import User from "./User";

type Task = {
  id: string;
  name: string;
  categoryId: string;
  isCompleted: boolean;
  user: User;
};

export default Task;
