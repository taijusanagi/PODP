import { Button, HStack, Image, Input, Stack, Text, VStack } from "@chakra-ui/react";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { NextPage } from "next";
import { useState } from "react";

import { Layout } from "@/components/Layout";
import { Unit } from "@/components/Unit";
import { useIsSignedIn } from "@/hooks/useIsSignedIn";

import configJsonFile from "../../config.json";

const HomePage: NextPage = () => {
  const { isSignedIn } = useIsSignedIn();
  const { openConnectModal } = useConnectModal();

  const [dealId, setDealId] = useState("");

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

        {isSignedIn && (
          <Stack spacing="8">
            <Unit header={"Claim Proof of data preservation SBTs"}>
              <Stack spacing="2">
                <Input
                  placeholder={"input filecoin deal id which preserves the data"}
                  type={"text"}
                  value={dealId}
                  size="lg"
                  fontSize="sm"
                  onChange={(e) => setDealId(e.target.value)}
                />
                <Button w="full">Claim</Button>
              </Stack>
            </Unit>
            {/* <Unit header={"Minted SBTs"}>
              <Stack></Stack>
            </Unit> */}
          </Stack>
        )}
      </Stack>
    </Layout>
  );
};

export default HomePage;
