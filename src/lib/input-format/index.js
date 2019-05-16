import { default as templateParser } from './source/template-parser.js'

import { default as templateFormatter } from './source/template-formatter.js'

import { default as parseDigit } from './source/parse-digit.js'

import { default as parse } from './source/parse.js'

import { default as format } from './source/format.js'

import
{
	onChange,
	onPaste,
	onCut,
	onKeyDown
}
from './source/input-control.js'

export default {
	templateParser,
	templateFormatter,
	parseDigit,
	parse,
	format,
	onChange,
	onPaste,
	onCut,
	onKeyDown
}