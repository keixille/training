package com.spring.tutorial.basicPolymorphism;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;

import java.io.ByteArrayOutputStream;
import java.io.PrintStream;
import java.util.stream.Stream;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;

class GetSelectedPhoneTest {
  private final PrintStream standardOut = System.out;
  private final ByteArrayOutputStream outputStreamCaptor = new ByteArrayOutputStream();

  @BeforeEach
  public void setUp() {
    System.setOut(new PrintStream(outputStreamCaptor));
  }

  @AfterEach
  public void tearDown() {
    System.setOut(standardOut);
  }

  @ParameterizedTest
  @MethodSource("getSelectedPhoneArguments")
  void testPolymorphism(MobilePhone mobilePhone, String expectedOutput) {
    // GIVEN
    GetSelectedPhone getSelectedPhone = new GetSelectedPhone();

    // WHEN
    getSelectedPhone.getSelectedPhone(mobilePhone);

    // THEN
    assertThat(outputStreamCaptor.toString().trim()).isEqualTo(expectedOutput);
  }

  @ParameterizedTest
  @MethodSource("getAdditionalSelectedPhoneArguments")
  void testDynamicPolymorphism(MobilePhone mobilePhone, String expectedOutput) {
    // GIVEN
    GetSelectedPhone getSelectedPhone = new GetSelectedPhone();

    // WHEN
    getSelectedPhone.getAdditionalSelectedPhone(mobilePhone);

    // THEN
    assertThat(outputStreamCaptor.toString().trim()).isEqualTo(expectedOutput);
  }

  private static Stream<Arguments> getSelectedPhoneArguments() {
    return Stream.of(
        Arguments.of(new Nexus4(), "Inside Nexus 4!"),
        Arguments.of(new IPhone5S(), "Inside iPhone 5s!"));
  }

  private static Stream<Arguments> getAdditionalSelectedPhoneArguments() {
    return Stream.of(
        Arguments.of(new Nexus4(), "Inside Nexus 4!"),
        Arguments.of(new IPhone5S(), "Inside iPhone 5s!\nInside finger print locker!"));
  }
}
