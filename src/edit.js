/**
 * Internal dependencies
 */
import './editor.scss';

/**
 * WordPress dependencies
 */
import { edit, globe } from '@wordpress/icons';
import { useBlockProps, BlockControls } from '@wordpress/block-editor';
import {
	ComboboxControl,
	Placeholder,
	ToolbarButton,
	ToolbarGroup,
} from '@wordpress/components';
import { useEffect, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';

/**
 * Internal dependencies
 */
import countries from '../assets/countries.json';
import { getEmojiFlag } from './utils';
import Preview from './preview';

export default function Edit( { attributes, setAttributes } ) {
	const { countryCode, relatedPosts } = attributes;
	const options = Object.keys( countries ).map( ( code ) => ( {
		value: code,
		label: getEmojiFlag( code ) + '  ' + countries[ code ] + ' — ' + code,
	} ) );

	const [ isPreview, setPreview ] = useState();

	useEffect( () => setPreview( countryCode ), [ countryCode ] );

	const handleChangeCountry = () => {
		if ( isPreview ) setPreview( false );
		else if ( countryCode ) setPreview( true );
	};

	const handleChangeCountryCode = ( newCountryCode ) => {
		if ( newCountryCode && countryCode !== newCountryCode ) {
			setAttributes( {
				countryCode: newCountryCode,
				relatedPosts: [],
			} );
		}
	};

	useEffect( () => {
		async function getRelatedPosts() {
			if ( ! countryCode ) return;

			const postId = wp.data.select( 'core/editor' ).getCurrentPostId();

			const query = {
				search: countries[ countryCode ],
				exclude: postId,
			};

			await apiFetch( {
				path: `/wp/v2/posts/?${ new URLSearchParams(
					query
				).toString() }`,
			} )
				.then( ( posts ) => {
					setAttributes( {
						relatedPosts:
							posts?.map( ( relatedPost ) => ( {
								...relatedPost,
								title:
									relatedPost.title?.rendered ||
									relatedPost.link,
								excerpt: relatedPost.excerpt?.rendered || '',
							} ) ) || [],
					} );
				} )
				.catch( ( error ) => {
					throw new Error(
						`HTTP error! Status: ${ error.data.status }`
					);
				} );
		}

		getRelatedPosts();
	}, [ countryCode, setAttributes ] );

	return (
		<div { ...useBlockProps() }>
			<BlockControls>
				<ToolbarGroup>
					<ToolbarButton
						label={ __( 'Change Country', 'xwp-country-card' ) }
						icon={ edit }
						onClick={ handleChangeCountry }
						disabled={ ! Boolean( countryCode ) }
					/>
				</ToolbarGroup>
			</BlockControls>

			{ ! isPreview && (
				<Placeholder
					icon={ globe }
					label={ __( 'XWP Country Card', 'xwp-country-card' ) }
					isColumnLayout={ true }
					instructions={ __(
						'Type in a name of a contry you want to display on you site.',
						'xwp-country-card'
					) }
				>
					<ComboboxControl
						label={ __( 'Country', 'xwp-country-card' ) }
						hideLabelFromVision
						options={ options }
						value={ countryCode }
						onChange={ handleChangeCountryCode }
						allowReset={ true }
					/>
				</Placeholder>
			) }
			<Preview
				countryCode={ countryCode }
				relatedPosts={ relatedPosts }
			/>
		</div>
	);
}
