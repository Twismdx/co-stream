export const customSvgPath = (args) => {
	const width = args.canvasSize.x * 0.95 // 95% of screen width
	const height = 120
	const top = 165
	const left = (args.canvasSize.x - width) / 2 // center the rectangle

	if (args.step?.name === 'five') {
		return `M0,0H${args.canvasSize.x}V${args.canvasSize.y}H0V0ZM${
			args.position.x._value
		},165H${args.position.x._value + args.size.x._value}V285H${
			args.position.x._value
		}V165Z`
	} else {
		return `M0,0H${args.canvasSize.x}V${args.canvasSize.y}H0V0ZM${
			args.position.x._value
		},${args.position.y._value}H${
			args.position.x._value + args.size.x._value
		}V${args.position.y._value + args.size.y._value}H${
			args.position.x._value
		}V${args.position.y._value}Z`
	}
}
