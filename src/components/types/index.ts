import React from "react";

export type HTMLAttributes<T> = React.HTMLAttributes<T>;

export type  StateDispatch<T>  = React.Dispatch<React.SetStateAction<T>> 

export type Options = {
  value: string;
  label: string;
};
