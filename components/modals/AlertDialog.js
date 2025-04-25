import { View, Button, Text, Dimensions } from "react-native";
import React, { Children } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import { useGlobalContext } from "../timer/context";

const windowWidth = Dimensions.get("window").width;

export default function Dialog({
  title,
  desc,
  desc2,
  desc3,
  cancel,
  action,
  open,
  actionPress,
  cancelPress,
  children,
}) {
  const { theme } = useGlobalContext();
  const activeColors = theme.colors[theme.mode];
  const [isOpen, setIsOpen] = React.useState(false);

  React.useEffect(() => {
    setIsOpen(open);
  }, [open]);

  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent
        style={{
          backgroundColor: activeColors.primary,
          borderWidth: 1,
          borderColor: activeColors.modalBorder,
        }}
      >
        <AlertDialogHeader>
          <AlertDialogTitle
            style={{
              fontSize: 24,
              paddingBottom: 10,
              color: "orange",
              opacity: 0.9,
              marginBottom: 5,
            }}
          >
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription
            style={{
              paddingBottom: children ? 15 : -30,
            }}
          >
            <Text
              style={{
                textAlign: "center",
                fontSize: 14,
                color: "white",
                opacity: 0.7,
                fontWeight: 500,
              }}
            >
              {desc}
            </Text>
            {"\n"}
            {"\n"}
            <Text
              style={{
                textAlign: "center",
                fontSize: 18,
                color: activeColors.accent,
                opacity: 1,
                fontWeight: 500,
              }}
            >
              {desc2}
            </Text>
            {"\n"}
            {"\n"}
            <Text
              style={{
                textAlign: "center",
                fontSize: 14,
                color: "white",
                opacity: 0.7,
              }}
            >
              {desc3}
            </Text>
          </AlertDialogDescription>
          {children}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            textStyle={{ color: activeColors.modalTitle, opacity: 0.9 }}
            style={{ backgroundColor: "transparent", marginRight: 5 }}
            onPress={cancelPress}
          >
            {cancel}
          </AlertDialogCancel>
          <AlertDialogAction
            textStyle={{ color: activeColors.modalSurface }}
            style={{
              color: activeColors.modalButton,
              padding: 5,
              marginLeft: 5,
            }}
            onPress={actionPress}
          >
            {action}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
