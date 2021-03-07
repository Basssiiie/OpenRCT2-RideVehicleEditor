/**
 * A wrapper for talking to a view or widget.
 */
export default interface BindingContext<TView>
{
	/**
	 * Updates a field on the view to the specified value.
	 * 
	 * @param key The name of the field or property.
	 * @param value The value to set it to.
	 */
	setField<TField extends keyof TView>(key: keyof TView, value: TView[TField]): void
}