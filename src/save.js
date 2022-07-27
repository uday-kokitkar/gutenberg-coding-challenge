/**
 * WordPress dependencies
 */
import { useBlockProps } from '@wordpress/block-editor';

/**
 * Internal dependencies
 */
import Preview from './preview';

export default function Save( { attributes } ) {
	return (
		<div { ...useBlockProps.save() }>
			<Preview { ...attributes } />
		</div>
	);
}
