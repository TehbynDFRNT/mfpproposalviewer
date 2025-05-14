import React from 'react';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Label } from '../../components/ui/label';
import { Input } from '../../components/ui/input';
import SomeComponent from '../components/SomeComponent';
import { cn } from '../lib/utils';

export default function TestComponent() {
  return (
    <div>
      <Button>Click me</Button>
      <Card>
        <Label>Label</Label>
        <Input />
      </Card>
    </div>
  );
}