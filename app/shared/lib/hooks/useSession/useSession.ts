import { type RealtimeChannel, type Session } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';

import { supaClient } from '~/shared/configs/supabase/supa-client.server';

export type UserProfile = {
  username: string;
  avatarUrl?: string;
};

export type SupashipUserInfo = {
  session: Session | null;
  profile: UserProfile | null;
};

export function useSession(): SupashipUserInfo {
  const [userInfo, setUserInfo] = useState<SupashipUserInfo>({
    profile: null,
    session: null,
  });

  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  useEffect(() => {
    supaClient.auth
      .getSession()
      .then(({ data: { session } }) => {
        setUserInfo({ ...userInfo, session });
        supaClient.auth.onAuthStateChange((_event, session) => {
          setUserInfo({ session, profile: null });
        });
      })
      .catch(console.log);
  }, []);

  useEffect(() => {
    if (userInfo.session?.user != null && userInfo.profile == null) {
      listenToUserProfileChanges(userInfo.session.user.id)
        .then((newChannel) => {
          if (channel != null) {
            channel.unsubscribe().catch(console.log);
          }
          setChannel(newChannel);
        })
        .catch(console.log);
    } else if (userInfo.session?.user == null) {
      channel?.unsubscribe().catch(console.log);
      setChannel(null);
    }
  }, [userInfo.session]);

  async function listenToUserProfileChanges(userId: string) {
    const { data } = await supaClient
      .from('user_profiles')
      .select('*')
      .filter('user_id', 'eq', userId);

    if (data?.[0] !== undefined) {
      setUserInfo({ ...userInfo, profile: data?.[0] as UserProfile });
    }

    return supaClient
      .channel(`public:user_profiles`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_profiles',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          setUserInfo({ ...userInfo, profile: payload.new as UserProfile });
        },
      )
      .subscribe();
  }

  return userInfo;
}
