


export type Params<T extends WidgetBase> = Omit<T, "type">;


export type DisabledMessage = 
{ 
	disabledMessage?: string 
};
