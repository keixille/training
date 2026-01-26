import 'package:flutter/material.dart';

void main() {
  runApp(MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Hello World Web',
      home: Scaffold(
        appBar: AppBar(title: Text('Hello World Web App')),
        body: Center(
          child: Text('Welcome to Flutter Web!', style: TextStyle(fontSize: 24)),
        ),
      ),
    );
  }
}
