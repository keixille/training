package com.spring.tutorial.basicPolymorphism;

public class GetSelectedPhone {
  void getSelectedPhone(MobilePhone mobilePhone) {
    mobilePhone.show();
  }

  void getAdditionalSelectedPhone(MobilePhone mobilePhone) {
    mobilePhone.show();

    if (mobilePhone instanceof IPhone5S iphone) {
      iphone.fingerPrintLocker();
    }
  }
}
