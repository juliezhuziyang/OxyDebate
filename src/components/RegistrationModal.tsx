import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Users, Gavel } from 'lucide-react';

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'debater' | 'judge';
  onSubmit: (formData: any) => void;
}

export const RegistrationModal = ({ isOpen, onClose, type, onSubmit }: RegistrationModalProps) => {
  const [formData, setFormData] = useState(
    type === 'debater'
      ? { name: '', email: '', school: '', partner_name: '', partner_email: '', team_name: '' }
      : { name: '', email: '', debate_experience: '', judge_experience: '' }
  );
  const [privacyAccepted, setPrivacyAccepted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!privacyAccepted) {
      alert('Please accept the privacy policy to continue.');
      return;
    }
    onSubmit(formData);
    onClose();
    setFormData(
      type === 'debater'
        ? { name: '', email: '', school: '', partner_name: '', partner_email: '', team_name: '' }
        : { name: '', email: '', debate_experience: '', judge_experience: '' }
    );
    setPrivacyAccepted(false);
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const privacyContract = `
PRIVACY POLICY & TERMS OF PARTICIPATION

By participating in the Oxymorona Tournament, you agree to the following:

1. DATA COLLECTION AND USE
- We collect personal information including name, email, school affiliation, and debate experience
- Your information will be used solely for tournament organization and administration
- We may contact you regarding tournament updates, scheduling, and results

2. DATA SHARING
- Your name and school may be displayed in tournament brackets and results
- Personal contact information will not be shared with third parties
- Results and statistics may be published for tournament records

3. PHOTOGRAPHY AND RECORDING
- The tournament may be photographed or recorded for promotional purposes
- By participating, you consent to the use of your image in tournament materials
- You may request removal of your image by contacting tournament organizers

4. PARTICIPATION REQUIREMENTS
- All participants must conduct themselves professionally and respectfully
- Tournament organizers reserve the right to remove participants for misconduct
- Registration information must be accurate and complete

5. LIABILITY
- Participants compete at their own risk
- Tournament organizers are not liable for personal injury or property damage
- By participating, you waive claims against the tournament organizers

6. DATA RETENTION
- Your information will be retained for the duration of the tournament and one year after
- You may request deletion of your data at any time by contacting us
- Essential records may be kept for historical tournament documentation

Contact Information: juliezhu.ziyang@gmail.com
`;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {type === 'debater' ? <Users className="h-5 w-5" /> : <Gavel className="h-5 w-5" />}
            {type === 'debater' ? 'Register as Debater' : 'Apply as Judge'}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh]">
          <div className="space-y-6 pr-4">
            {/* Privacy Policy */}
            <div>
              <h3 className="font-semibold mb-3">Privacy Policy & Terms</h3>
              <div className="bg-muted p-4 rounded-lg text-xs max-h-40 overflow-y-auto">
                <pre className="whitespace-pre-wrap font-sans text-muted-foreground leading-relaxed">{privacyContract}</pre>
              </div>
              
              <div className="flex items-center space-x-2 mt-3">
                <Checkbox
                  id="privacy"
                  checked={privacyAccepted}
                  onCheckedChange={(checked) => setPrivacyAccepted(checked === true)}
                />
                <label htmlFor="privacy" className="text-sm">
                  I have read and agree to the privacy policy and terms of participation
                </label>
              </div>
            </div>

            <Separator />

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <h3 className="font-semibold">Registration Information</h3>
              
              {type === 'judge' && (
                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 mb-4">
                  <p className="text-sm text-amber-800 dark:text-amber-200">
                    <strong>Note:</strong> Judge applications are subject to approval. We will review your application and contact you within one week to confirm your status. Not all applications may be approved based on tournament requirements.
                  </p>
                </div>
              )}
              
              {type === 'debater' ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      placeholder="Your name"
                      value={formData.name}
                      onChange={(e) => updateFormData('name', e.target.value)}
                      required
                    />
                    <Input
                      type="email"
                      placeholder="Your email"
                      value={formData.email}
                      onChange={(e) => updateFormData('email', e.target.value)}
                      required
                    />
                  </div>
                  
                  <Input
                    placeholder="School/Institution"
                    value={formData.school}
                    onChange={(e) => updateFormData('school', e.target.value)}
                    required
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      placeholder="Partner's name"
                      value={formData.partner_name}
                      onChange={(e) => updateFormData('partner_name', e.target.value)}
                      required
                    />
                    <Input
                      type="email"
                      placeholder="Partner's email"
                      value={formData.partner_email}
                      onChange={(e) => updateFormData('partner_email', e.target.value)}
                      required
                    />
                  </div>
                  
                  <Input
                    placeholder="Team name"
                    value={formData.team_name}
                    onChange={(e) => updateFormData('team_name', e.target.value)}
                    required
                  />
                </>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      placeholder="Your name"
                      value={formData.name}
                      onChange={(e) => updateFormData('name', e.target.value)}
                      required
                    />
                    <Input
                      type="email"
                      placeholder="Your email"
                      value={formData.email}
                      onChange={(e) => updateFormData('email', e.target.value)}
                      required
                    />
                  </div>
                  
                  <Textarea
                    placeholder="Describe your debate experience (participation, coaching, etc.)"
                    value={formData.debate_experience}
                    onChange={(e) => updateFormData('debate_experience', e.target.value)}
                    rows={3}
                    required
                  />
                  
                  <Textarea
                    placeholder="Describe your judging experience (tournaments judged, training received, etc.)"
                    value={formData.judge_experience}
                    onChange={(e) => updateFormData('judge_experience', e.target.value)}
                    rows={3}
                    required
                  />
                </>
              )}

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1"
                  disabled={!privacyAccepted}
                >
                  {type === 'debater' ? 'Register Team' : 'Submit Application'}
                </Button>
              </div>
            </form>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};