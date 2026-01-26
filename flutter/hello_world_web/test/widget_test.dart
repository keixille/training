import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:hello_world_web/main.dart';

void main() {
  testWidgets('Should have MaterialApp with title: Hello World Web', (
    WidgetTester tester,
  ) async {
    // Given
    // When
    await tester.pumpWidget(MyApp());

    // Then
    final MaterialApp app = tester.widget(find.byType(MaterialApp));
    expect(app.title, equals('Hello World Web'));
  });

  testWidgets('Should have AppBar with title: Hello World Web App', (
    WidgetTester tester,
  ) async {
    // Given
    // When
    await tester.pumpWidget(MyApp());

    // Then
    final appBarText = find.descendant(
      of: find.byType(AppBar),
      matching: find.text('Hello World Web App'),
    );
    expect(appBarText, findsOneWidget);
  });

  testWidgets('Should have center text: Hello World', (
    WidgetTester tester,
  ) async {
    // Given
    await tester.pumpWidget(MyApp());

    // Then
    expect(find.byType(Center), findsOneWidget);
    expect(find.text('Welcome to Flutter Web!'), findsOneWidget);
  });
}
