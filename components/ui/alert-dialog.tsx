import * as AlertDialogPrimitive from '@rn-primitives/alert-dialog';
import * as React from 'react';
import {
    Platform,
    StyleSheet,
    View,
    Text,
    ViewProps,
    StyleProp,
    ViewStyle,
    TextStyle,
} from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useGlobalContext } from '../timer/context';

// Define inline styles for buttons
const primaryButtonStyle: StyleProp<ViewStyle> = {
    paddingVertical: 8,
    paddingHorizontal: 30,
    backgroundColor: 'hsl(0, 0%, 98%)', // default blue (will be overridden)
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
};

const primaryButtonTextStyle: StyleProp<TextStyle> = {
    fontSize: 16,
    color: 'hsl(240, 10%, 3.9%)', // default white (will be overridden)
    fontWeight: '400',
};

const outlineButtonStyle: StyleProp<ViewStyle> = {
    paddingVertical: 8,
    paddingHorizontal: 30,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'hsl(240, 5.9%, 90%)', // default blue (will be overridden)
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
};

const outlineButtonTextStyle: StyleProp<TextStyle> = {
    fontSize: 16,
    color: 'hsl(240, 5.9%, 90%)', // default blue (will be overridden)
    fontWeight: '400',
};

const AlertDialog = AlertDialogPrimitive.Root;
const AlertDialogTrigger = AlertDialogPrimitive.Trigger;
const AlertDialogPortal = AlertDialogPrimitive.Portal;

//
// AlertDialogOverlay
//
interface OverlayProps extends AlertDialogPrimitive.OverlayProps {
    style?: StyleProp<ViewStyle>;
    children?: React.ReactNode;
}

const AlertDialogOverlayWeb = React.forwardRef<
    AlertDialogPrimitive.OverlayRef,
    OverlayProps
>(({ style, ...props }, ref) => {
    // Inline style approximating Tailwind: 
    // z-50 bg-black/80 flex justify-center items-center p-2 absolute top-0 right-0 bottom-0 left-0
    const overlayStyle: ViewStyle = {
        zIndex: 50,
        backgroundColor: 'rgba(0,0,0,0.8)',
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 8,
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
    };
    return (
        <AlertDialogPrimitive.Overlay
            style={[overlayStyle, style]}
            {...props}
            ref={ref}
        />
    );
});
AlertDialogOverlayWeb.displayName = 'AlertDialogOverlayWeb';

const AlertDialogOverlayNative = React.forwardRef<
    AlertDialogPrimitive.OverlayRef,
    OverlayProps
>(({ style, children, ...props }, ref) => {
    const overlayNativeStyle: ViewStyle = {
        zIndex: 50,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 8,
    };
    return (
        <AlertDialogPrimitive.Overlay
            style={[StyleSheet.absoluteFill, overlayNativeStyle, style]}
            {...props}
            ref={ref}
            asChild
        >
            <Animated.View entering={FadeIn.duration(150)} exiting={FadeOut.duration(150)}>
                {children}
            </Animated.View>
        </AlertDialogPrimitive.Overlay>
    );
});
AlertDialogOverlayNative.displayName = 'AlertDialogOverlayNative';

const AlertDialogOverlay = Platform.select({
    web: AlertDialogOverlayWeb,
    default: AlertDialogOverlayNative,
});

//
// AlertDialogContent
//
interface ContentProps extends AlertDialogPrimitive.ContentProps {
    portalHost?: string;
    style?: StyleProp<ViewStyle>;
}

const AlertDialogContent = React.forwardRef<
    AlertDialogPrimitive.ContentRef,
    ContentProps
>(({ style, portalHost, ...props }, ref) => {
    const { theme } = useGlobalContext();
    const activeColors = theme.colors[theme.mode];
    // Inline style approximating Tailwind:
    // z-50 max-w-lg gap-4 border border-border bg-background p-6 shadow-lg shadow-foreground/10 web:duration-200 rounded-lg
    const contentStyle: ViewStyle = {
        zIndex: 50,
        maxWidth: 512, // approximate max-w-lg
        borderWidth: 1,
        borderColor: activeColors.border,
        backgroundColor: activeColors.surface,
        padding: 24,
        borderRadius: 8,
        // Shadow (iOS) and elevation (Android)
        shadowColor: '#fff',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.20,
        shadowRadius: 1.41,
        elevation: 2,
    };
    return (
        <AlertDialogPortal hostName={portalHost}>
            <AlertDialogOverlay>
                <AlertDialogPrimitive.Content
                    ref={ref}
                    style={[contentStyle, style]}
                    {...props}
                />
            </AlertDialogOverlay>
        </AlertDialogPortal>
    );
});
AlertDialogContent.displayName = AlertDialogPrimitive.Content.displayName;

//
// AlertDialogHeader
//
interface AlertDialogHeaderProps extends ViewProps {
    style?: StyleProp<ViewStyle>;
    children?: React.ReactNode;
}

const AlertDialogHeader: React.FC<AlertDialogHeaderProps> = ({ style, children, ...props }) => {
    // Approximates Tailwind's: flex flex-col gap-2
    const headerStyle: ViewStyle = {
        flexDirection: 'column',
        // paddingBottom: 15,
        gap: 2,
    };
    return (
        <View style={[headerStyle, style]} {...props}>
            {children}
        </View>
    );
};
AlertDialogHeader.displayName = 'AlertDialogHeader';

//
// AlertDialogFooter
//
interface AlertDialogFooterProps extends ViewProps {
    style?: StyleProp<ViewStyle>;
    children?: React.ReactNode;
}

const AlertDialogFooter: React.FC<AlertDialogFooterProps> = ({ style, children, ...props }) => {
    // Approximates Tailwind's: flex flex-col-reverse sm:flex-row sm:justify-end gap-2
    // Here we use a simple row layout.
    const footerStyle: ViewStyle = {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingTop: 25,
        gap: 2,
    };
    return (
        <View style={[footerStyle, style]} {...props}>
            {children}
        </View>
    );
};
AlertDialogFooter.displayName = 'AlertDialogFooter';

//
// AlertDialogTitle
//
interface TitleProps extends AlertDialogPrimitive.TitleProps {
    style?: StyleProp<TextStyle>;
}

const AlertDialogTitle = React.forwardRef<
    AlertDialogPrimitive.TitleRef,
    TitleProps
>(({ style, ...props }, ref) => {
    const { theme } = useGlobalContext();
    const activeColors = theme.colors[theme.mode];
    // Approximates Tailwind's: text-lg native:text-xl text-foreground font-semibold
    const titleStyle: TextStyle = {
        fontSize: Platform.OS === 'android' || Platform.OS === 'ios' ? 20 : 18,
        color: activeColors.modalTitle,
        fontWeight: '600',
    };
    return (
        <AlertDialogPrimitive.Title
            ref={ref}
            style={[titleStyle, style]}
            {...props}
        />
    );
});
AlertDialogTitle.displayName = AlertDialogPrimitive.Title.displayName;

//
// AlertDialogDescription
//
interface DescriptionProps extends AlertDialogPrimitive.DescriptionProps {
    style?: StyleProp<TextStyle>;
}

const AlertDialogDescription = React.forwardRef<
    AlertDialogPrimitive.DescriptionRef,
    DescriptionProps
>(({ style, ...props }, ref) => {
    const { theme } = useGlobalContext();
    const activeColors = theme.colors[theme.mode];
    // Approximates Tailwind's: text-sm native:text-base text-muted-foreground
    const descriptionStyle: TextStyle = {
        fontSize: Platform.OS === 'android' || Platform.OS === 'ios' ? 16 : 14,
        color: activeColors.modalText,
    };
    return (
        <AlertDialogPrimitive.Description
            ref={ref}
            style={[descriptionStyle, style]}
            {...props}
        />
    );
});
AlertDialogDescription.displayName = AlertDialogPrimitive.Description.displayName;

//
// AlertDialogAction
//
interface ActionProps extends AlertDialogPrimitive.ActionProps {
    style?: StyleProp<ViewStyle>;
    textStyle?: StyleProp<TextStyle>;
    children?: React.ReactNode;
}

const AlertDialogAction = React.forwardRef<
    AlertDialogPrimitive.ActionRef,
    ActionProps
>(({ style, textStyle, ...props }, ref) => {
    const { theme } = useGlobalContext();
    const activeColors = theme.colors[theme.mode];
    // Update the button style to use activeColors.submit and text color to activeColors.foreground
    const actionButtonStyle = {
        ...primaryButtonStyle,
        backgroundColor: activeColors.modalButton,
    };
    const actionTextStyle = {
        ...primaryButtonTextStyle,
        color: activeColors.modalSurface,
    };
    return (
        <AlertDialogPrimitive.Action ref={ref} style={[actionButtonStyle, style]} {...props}>
            {props.children ? (
                <Text style={[actionTextStyle, textStyle]}>{props.children}</Text>
            ) : null}
        </AlertDialogPrimitive.Action>
    );
});
AlertDialogAction.displayName = AlertDialogPrimitive.Action.displayName;

//
// AlertDialogCancel
//
interface CancelProps extends AlertDialogPrimitive.CancelProps {
    style?: StyleProp<ViewStyle>;
    textStyle?: StyleProp<TextStyle>;
    children?: React.ReactNode;
}

const AlertDialogCancel = React.forwardRef<
    AlertDialogPrimitive.CancelRef,
    CancelProps
>(({ style, textStyle, ...props }, ref) => {
    const { theme } = useGlobalContext();
    const activeColors = theme.colors[theme.mode];
    // Update the cancel button style to use activeColors.error and text color to activeColors.foreground
    const cancelButtonStyle = {
        ...outlineButtonStyle,
        borderColor: activeColors.modalBorder,
    };
    const cancelTextStyle = {
        ...outlineButtonTextStyle,
        color: activeColors.modalTitle,
    };
    return (
        <AlertDialogPrimitive.Cancel ref={ref} style={[cancelButtonStyle, style]} {...props}>
            {props.children ? (
                <Text style={[cancelTextStyle, textStyle]}>{props.children}</Text>
            ) : null}
        </AlertDialogPrimitive.Cancel>
    );
});
AlertDialogCancel.displayName = AlertDialogPrimitive.Cancel.displayName;

export {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogOverlay,
    AlertDialogPortal,
    AlertDialogTitle,
    AlertDialogTrigger,
};
