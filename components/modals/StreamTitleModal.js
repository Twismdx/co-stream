// import React, {
//   useRef,
//   useState,
//   useEffect,
//   useCallback,
//   useMemo,
// } from "react";
// import { View, Text, TouchableOpacity } from "react-native";
// import { useGlobalContext } from "../timer/context";
// import { useNavigation } from '@react-navigation/native';
// import CustomButton from "../CustomButton";
// import { BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
// import { Separator } from "../ui/separator";
// import * as Linking from "expo-linking";

// export default function StreamTitleModal() {
//   const {
//     theme,
//     showModal,
//     setShowModal,
//     streamTitle,
//     setStreamTitle,
//     desc,
//     setDesc,
//     actionSheet,
//     local,
//     destination,
//     setDestination,
//     setActionSheet,
//     copy,
//     setCopy,
//   } = useGlobalContext();

//   const activeColors = theme.colors[theme.mode];
//
//   const titleRef = useRef(null);
//   const descRef = useRef(null);
//   const [keyboardMargin, setKeyboardMargin] = useState(0);
//   // Replace modalRef with bottomSheetModalRef from gorhom
//   const bottomSheetModalRef = useRef(null);
//   const [isActive, setIsActive] = useState(false);

//   // Wizard step state: 0 = destination selection, 1 = title & description, 2 = match pin
//   const [step, setStep] = useState(0);
//   const [selectedDestination, setSelectedDestination] = useState("profile");
//   const [pagesOrGroups, setPagesOrGroups] = useState([]);
//   const [selectedPageOrGroup, setSelectedPageOrGroup] = useState(null);

//   // Sample data for pages and groups
//   const samplePages = [
//     { id: "1", name: "Page One" },
//     { id: "2", name: "Page Two" },
//     { id: "3", name: "Page Three" },
//   ];
//   const sampleGroups = [
//     { id: "g1", name: "Group A" },
//     { id: "g2", name: "Group B" },
//     { id: "g3", name: "Group C" },
//   ];

//   useEffect(() => {
//     if (showModal) {
//       setIsActive(true);
//       bottomSheetModalRef.current?.present();
//     } else {
//       setIsActive(false);
//       bottomSheetModalRef.current?.dismiss();
//     }
//   }, [showModal]);

//   const closePanel = () => {
//     setShowModal(false);
//     setIsActive(false);
//     setStep(0); // Reset wizard on dismiss
//   };

//   // Handler to go to the next step
//   const handleNext = () => {
//     if (step === 0) {
//       // For page or group, ensure a selection has been made
//       if (
//         (selectedDestination === "page" || selectedDestination === "group") &&
//         !selectedPageOrGroup
//       ) {
//         return; // Optionally, show an alert here
//       }
//       // Save the destination (using the page/group name if applicable)
//       setDestination(
//         selectedDestination === "profile" ? "profile" : selectedPageOrGroup.name
//       );
//     }
//     setStep((prev) => prev + 1);
//   };

//   // When submitting, close the sheet and navigate

//   return (
//     <BottomSheetModal
//       ref={bottomSheetModalRef}
//       index={0}
//       snapPoints={["50%", "80%"]}
//       backgroundStyle={{
//         backgroundColor: activeColors.surface,
//         borderColor: activeColors.border,
//         borderWidth: 2,
//         borderRadius: 10,
//       }}
//       onDismiss={closePanel}
//     >
//       <BottomSheetView style={{ padding: 20, gap: 20 }}>
//         {step === 0 && renderDestinationSelection()}
//         {step === 1 && renderStreamTitleOptions()}
//         {step === 2 && renderMatchPin()}
//       </BottomSheetView>
//     </BottomSheetModal>
//   );
// }
