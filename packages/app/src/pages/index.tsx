/* eslint-disable camelcase */
import {
  Button,
  Flex,
  HStack,
  Icon,
  Image,
  Input,
  Link,
  SimpleGrid,
  Stack,
  Text,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { NextPage } from "next";
import { useEffect, useState } from "react";

import { Layout } from "@/components/Layout";
import { Modal } from "@/components/Modal";
import { Unit } from "@/components/Unit";
import { useConnectedChainId } from "@/hooks/useConnectedChainId";
import { useIsSignedIn } from "@/hooks/useIsSignedIn";

import configJsonFile from "../../config.json";

const HomePage: NextPage = () => {
  const { isSignedIn } = useIsSignedIn();
  const openConnectModal = useConnectModal();

  return (
    <Layout>
      <Stack spacing="8">
        <VStack>
          <Image src="/assets/hero.png" w="96" mx="auto" alt="logo" />
          <Text textAlign={"center"} fontSize={"md"} fontWeight={"bold"} color={configJsonFile.style.color.accent}>
            {configJsonFile.description}
          </Text>
        </VStack>
        {!isSignedIn && (
          <VStack>
            <HStack spacing="4">
              <Button
                fontWeight={"bold"}
                variant="secondary"
                onClick={() => window.open(`${configJsonFile.url.github}/blob/main/README.md`, "_blank")}
              >
                Docs
              </Button>
              <Button fontWeight={"bold"} onClick={openConnectModal}>
                Connect Wallet
              </Button>
            </HStack>
          </VStack>
        )}
        {isSignedIn(
          <Unit header={configJsonFile.name}>
            <Stack></Stack>
          </Unit>
        )}
      </Stack>
    </Layout>
  );
};

export default HomePage;
