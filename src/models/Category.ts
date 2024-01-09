import User from "./User";

type Color = {
  id: string;
  code: string;
  name: string;
};

type Icon = {
  id: string;
  code: string;
  symbol: string;
};

type Category = {
  name: string;
  id: string;
  color: Color;
  icon: Icon;
  user: User;
  isEditable: boolean;
};

export { Color, Icon, Category };
