import { useEffect } from "react";
import styled from "styled-components";
import { useConfigStore } from "./stores";
import Map from "./map";
import Panel from "./panel";

const Wrapper = styled.div`
  position: relative;
  width: 100vw;
  height: 100vh;
`;

export default function Index() {
  useEffect(() => {
    return useConfigStore.getState().reset();
  }, []);
  return (
    <Wrapper>
      <Map />
      <Panel />
    </Wrapper>
  );
}
